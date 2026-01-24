import { createBulkTransactionsAction, getObrasForDespesaAction } from '../actions/obrasActions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('obraslinkActions', () => {
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    describe('createBulkTransactionsAction', () => {
        beforeEach(() => {
            mockSupabase.eq = jest.fn().mockReturnThis()
            mockSupabase.in = jest.fn().mockReturnThis()
        })

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

            mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
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

            mockSupabase.in.mockResolvedValueOnce({
                data: [{ subcategories_id: 's1' }],
                error: null
            })
            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await createBulkTransactionsAction(transactions)

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

    describe('getObrasForDespesaAction', () => {
        it('fetches and formats obras correctly', async () => {
            const mockData = [
                {
                    id: 1,
                    cliente_id: 10,
                    clientes: { nome: 'Cliente Obras' }
                }
            ]
            mockSupabase.select.mockResolvedValue({ data: mockData, error: null })

            const result = await getObrasForDespesaAction()

            expect(mockSupabase.from).toHaveBeenCalledWith('obras')
            expect(result).toEqual({
                ok: true,
                data: [{
                    ...mockData[0],
                    cliente_nome: 'Cliente Obras'
                }]
            })
        })

        it('handles fetch error', async () => {
            mockSupabase.select.mockResolvedValue({ data: null, error: new Error('Fetch Error') })

            const result = await getObrasForDespesaAction()

            expect(result).toEqual({ ok: false, error: 'Fetch Error' })
        })
    })
})
