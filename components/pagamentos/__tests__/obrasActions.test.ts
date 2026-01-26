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


        it('returns empty result if no transactions provided', async () => {
            const result = await createBulkTransactionsAction([])
            expect(result).toEqual({ ok: true, insertedCount: 0, duplicates: [] })
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        it('inserts all transactions', async () => {
            const transactions = [
                { cliente_id: 'c1', subcategories_id: 's1', amount: 100 },
                { cliente_id: 'c1', subcategories_id: 's2', amount: 200 },
            ]

            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await createBulkTransactionsAction(transactions)

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.insert).toHaveBeenCalledWith(transactions)
            expect(result).toEqual({
                ok: true,
                insertedCount: 2,
                duplicates: [],
            })
            expect(revalidatePath).toHaveBeenCalledWith('/pagamentos')
        })





        it('handles database error during insert', async () => {
            const transactions = [{ cliente_id: 'c1', subcategories_id: 's1' }]


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
