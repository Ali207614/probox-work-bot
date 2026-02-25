import type { HanaService } from './hana.service';
import type { ISlp } from '../interfaces/slp.interface';
import { normalizeUzPhone } from '../utils/uz-phone.util';
import { loadSQL } from '../utils/sql-loader.utils';

export class SapService {
  private readonly schema: string = process.env.SAP_SCHEMA ?? 'PROBOX_PROD_3';

  constructor(private readonly hana: HanaService) {}

  async getSlpByPhone(phone: string): Promise<ISlp | null> {
    const sql = loadSQL('sap/queries/get-slp-by-phone.sql').replace(/{{schema}}/g, this.schema);
    const { last9 } = normalizeUzPhone(phone);

    try {
      const rows = await this.hana.executeOnce<ISlp>(sql, [last9]);
      return rows[0] ?? null;
    } catch (err: unknown) {
      const wrapped = new Error(
        `SAP query failed (getSlpByPhone): ${err instanceof Error ? err.message : String(err)}`,
      );
      if (err instanceof Error) {
        wrapped.stack = err.stack ?? 'SAP Query failed';
      }
      throw wrapped;
    }
  }
}
