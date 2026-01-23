import { createBulkTransactionsAction, getObrasForDespesaAction } from '../actions/obraslinkActions'
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
        it('successfully inserts transactions', async () => {
            const transactions = [{ id: 1 }, { id: 2 }]
            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await createBulkTransactionsAction(transactions)

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.insert).toHaveBeenCalledWith(transactions)
            expect(result).toEqual({ ok: true })
            expect(revalidatePath).toHaveBeenCalledWith('/pagamentos')
        })

        it('handles insert error', async () => {
            mockSupabase.insert.mockResolvedValueOnce({ error: new Error('Insert Error') })

            const result = await createBulkTransactionsAction([])

            expect(result).toEqual({ ok: false, error: 'Insert Error' })
            expect(revalidatePath).not.toHaveBeenCalled()
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
