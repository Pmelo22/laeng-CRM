import { createBulkTransactionsAction, getObrasForReceitaAction } from '../actions/financeiroActions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('financeiroActions', () => {
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()

        // setup mocks for supabase chaining
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
        };

        (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    describe('createBulkTransactionsAction', () => {
        it('returns empty result if no transactions provided', async () => {
            const result = await createBulkTransactionsAction([])
            expect(result).toEqual({ ok: true, insertedCount: 0, duplicates: [] })
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        it('inserts new transactions when no duplicates exist', async () => {
            const transactions = [
                { cliente_id: 'c1', subcategories_id: 's1', amount: 100 },
                { cliente_id: 'c1', subcategories_id: 's2', amount: 200 },
            ]

            // Mock select to return empty array (no existing transactions)
            mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
            // Mock insert success
            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await createBulkTransactionsAction(transactions)

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.select).toHaveBeenCalledWith('subcategories_id')
            expect(mockSupabase.eq).toHaveBeenCalledWith('cliente_id', 'c1')
            expect(mockSupabase.insert).toHaveBeenCalledWith(transactions)
            expect(result).toEqual({
                ok: true,
                insertedCount: 2,
                duplicates: [],
            })
            expect(revalidatePath).toHaveBeenCalledWith('/pagamentos')
        })

        it('filters out duplicates and inserts only new ones', async () => {
            const transactions = [
                { cliente_id: 'c1', subcategories_id: 's1', amount: 100 },
                { cliente_id: 'c1', subcategories_id: 's2', amount: 200 },
            ]

            // s1 exists
            mockSupabase.in.mockResolvedValueOnce({
                data: [{ subcategories_id: 's1' }],
                error: null
            })
            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await createBulkTransactionsAction(transactions)

            // Should verify insert was called only with s2
            expect(mockSupabase.insert).toHaveBeenCalledWith([transactions[1]])
            expect(result).toEqual({
                ok: true,
                insertedCount: 1,
                duplicates: [{ subcategories_id: 's1' }]
            })
        })

        it('handles database error during check', async () => {
            const transactions = [{ cliente_id: 'c1', subcategories_id: 's1' }]
            const dbError = new Error('DB Check Error')

            mockSupabase.in.mockResolvedValueOnce({ data: null, error: dbError })

            const result = await createBulkTransactionsAction(transactions)

            expect(result).toEqual({ ok: false, error: 'DB Check Error' })
        })

        it('handles database error during insert', async () => {
            const transactions = [{ cliente_id: 'c1', subcategories_id: 's1' }]

            mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
            mockSupabase.insert.mockResolvedValueOnce({ error: new Error('Insert Error') })

            const result = await createBulkTransactionsAction(transactions)

            expect(result).toEqual({ ok: false, error: 'Insert Error' })
        })
    })

    describe('getObrasForReceitaAction', () => {
        it('fetches and formats obras correctly', async () => {
            const mockData = [
                {
                    id: 1,
                    cliente_id: 10,
                    clientes: { nome: 'Cliente Teste' }
                }
            ]
            mockSupabase.select.mockResolvedValue({ data: mockData, error: null })

            const result = await getObrasForReceitaAction()

            expect(mockSupabase.from).toHaveBeenCalledWith('obras')
            expect(result).toEqual({
                ok: true,
                data: [{
                    ...mockData[0],
                    cliente_nome: 'Cliente Teste'
                }]
            })
        })

        it('handles missing client name', async () => {
            const mockData = [
                {
                    id: 2,
                    cliente_id: 20,
                    clientes: null
                }
            ]
            mockSupabase.select.mockResolvedValue({ data: mockData, error: null })

            const result = await getObrasForReceitaAction()

            expect(result.ok).toBe(true)
            // @ts-ignore
            expect(result.data[0].cliente_nome).toBe('Cliente ID: 20 (Não encontrado)')
        })

        it('handles fetch error', async () => {
            mockSupabase.select.mockResolvedValue({ data: null, error: new Error('Fetch Error') })

            const result = await getObrasForReceitaAction()

            expect(result).toEqual({ ok: false, error: 'Fetch Error' })
        })
    })
})
