import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Product,
  SaleRecord,
  PurchaseRecord,
  IncomeRecord,
  ExpenseRecord,
  Customer,
  Supplier,
  StaffUser,
  StoreSettings,
} from '../types';
import { getCustomSupabaseClient, getActiveSupabaseConfig, isSupabaseConfigured } from './supabase';

export interface FullPosData {
  products: Product[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  customers: Customer[];
  suppliers: Supplier[];
  staff: StaffUser[];
  settings: StoreSettings;
  originDeviceId?: string;
  updatedAt?: string;
}

// Unique identifier for this client session to ignore self-echoes in Realtime
export const CLIENT_DEVICE_ID =
  'pos_' +
  (typeof window !== 'undefined' && window.crypto?.randomUUID
    ? window.crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 9)) +
  '_' +
  Date.now().toString(36);

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'fetching';

// Fetch the absolute latest POS data from Supabase
export const fetchLatestCloudData = async (
  client?: SupabaseClient | null
): Promise<{ success: boolean; data?: FullPosData; updatedAt?: string; error?: string }> => {
  const targetClient = client || getCustomSupabaseClient(getActiveSupabaseConfig().url, getActiveSupabaseConfig().anonKey);
  if (!targetClient) {
    return { success: false, error: 'Supabase client is not configured' };
  }

  try {
    const { data, error } = await targetClient
      .from('pos_backups')
      .select('*')
      .eq('id', 'latest_backup')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
        return { success: true, data: undefined }; // No cloud backup yet
      }
      return { success: false, error: error.message };
    }

    if (!data || !data.data_json) {
      return { success: true, data: undefined };
    }

    const payload = data.data_json as FullPosData;
    return {
      success: true,
      data: {
        products: Array.isArray(payload.products) ? payload.products : [],
        sales: Array.isArray(payload.sales) ? payload.sales : [],
        purchases: Array.isArray(payload.purchases) ? payload.purchases : [],
        incomes: Array.isArray(payload.incomes) ? payload.incomes : [],
        expenses: Array.isArray(payload.expenses) ? payload.expenses : [],
        customers: Array.isArray(payload.customers) ? payload.customers : [],
        suppliers: Array.isArray(payload.suppliers) ? payload.suppliers : [],
        staff: Array.isArray(payload.staff) ? payload.staff : [],
        settings: payload.settings || ({} as any),
        originDeviceId: data.origin_device_id || payload.originDeviceId,
        updatedAt: data.updated_at || payload.updatedAt,
      },
      updatedAt: data.updated_at,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch from cloud' };
  }
};

// Save POS data to Supabase
export const saveCloudData = async (
  posData: FullPosData,
  client?: SupabaseClient | null
): Promise<{ success: boolean; error?: string }> => {
  const targetClient = client || getCustomSupabaseClient(getActiveSupabaseConfig().url, getActiveSupabaseConfig().anonKey);
  if (!targetClient) {
    return { success: false, error: 'Supabase client is not configured' };
  }

  try {
    const timestamp = new Date().toISOString();
    const dataWithDevice: FullPosData = {
      ...posData,
      originDeviceId: CLIENT_DEVICE_ID,
      updatedAt: timestamp,
    };

    const rowPayload: any = {
      id: 'latest_backup',
      shop_name: posData.settings?.shopName || 'အရောင်းဆိုင်',
      phone: posData.settings?.phone || '',
      total_products: posData.products?.length || 0,
      total_sales: posData.sales?.length || 0,
      total_purchases: posData.purchases?.length || 0,
      total_customers: posData.customers?.length || 0,
      data_json: dataWithDevice,
      origin_device_id: CLIENT_DEVICE_ID,
      updated_at: timestamp,
    };

    const { error } = await targetClient
      .from('pos_backups')
      .upsert(rowPayload, { onConflict: 'id' });

    if (error) {
      // If column origin_device_id doesn't exist, retry without it
      if (error.message.includes('origin_device_id')) {
        delete rowPayload.origin_device_id;
        const { error: retryError } = await targetClient
          .from('pos_backups')
          .upsert(rowPayload, { onConflict: 'id' });
        if (retryError) {
          return { success: false, error: retryError.message };
        }
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save to cloud' };
  }
};

// Setup Supabase Realtime Subscription for instantaneous multi-device sync
export const subscribeToPosRealtime = (
  onRemoteUpdate: (cloudData: FullPosData, remoteOriginId?: string) => void,
  onStatusChange?: (status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR') => void
): (() => void) => {
  const config = getActiveSupabaseConfig();
  if (!isSupabaseConfigured(config.url, config.anonKey)) {
    onStatusChange?.('DISCONNECTED');
    return () => {};
  }

  const client = getCustomSupabaseClient(config.url, config.anonKey);
  if (!client) {
    onStatusChange?.('DISCONNECTED');
    return () => {};
  }

  let channel: RealtimeChannel | null = null;

  try {
    channel = client
      .channel('pos_realtime_sync_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_backups',
        },
        (payload: any) => {
          const newRecord = payload.new;
          if (!newRecord || !newRecord.data_json) return;

          const remoteData = newRecord.data_json as FullPosData;
          const originId = newRecord.origin_device_id || remoteData.originDeviceId;

          // Ignore self-broadcasts
          if (originId && originId === CLIENT_DEVICE_ID) {
            return;
          }

          onRemoteUpdate(remoteData, originId);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          onStatusChange?.('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          onStatusChange?.('ERROR');
        } else {
          onStatusChange?.('DISCONNECTED');
        }
      });
  } catch (err) {
    console.error('Realtime subscription error:', err);
    onStatusChange?.('ERROR');
  }

  return () => {
    if (channel && client) {
      try {
        client.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing channel:', e);
      }
    }
  };
};
