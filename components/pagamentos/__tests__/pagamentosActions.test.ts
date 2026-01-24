import { saveTransactionAction, updateTransactionAction } from '../actions/pagamentosActions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('pagamentosActions', () => {
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(), 
            insert: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),    
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    describe('saveTransactionAction', () => {
        const mockData = {
            amount: 100,
            date: '2023-01-01',
            type: 'Receita',
            subcategories_id: 'sub1',
            category_id: 'cat1'
        }

        it('inserts new transaction when valid data is provided without id', async () => {
            mockSupabase.insert.mockResolvedValueOnce({ error: null })

            const result = await saveTransactionAction(mockData)

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                amount: 100,
                type: 'Receita',
            }))
            expect(result).toEqual({ success: true, message: 'Salvo com sucesso' })
            expect(revalidatePath).toHaveBeenCalledWith('/pagamentos')
        })

        it('updates existing transaction when id is provided', async () => {
            mockSupabase.eq.mockResolvedValueOnce({ error: null })

            const result = await saveTransactionAction(mockData, '123')

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                amount: 100,
                updated_at: expect.any(String)
            }))
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123')
            expect(result).toEqual({ success: true, message: 'Salvo com sucesso' })
        })

        it('handles insert error', async () => {
            mockSupabase.insert.mockResolvedValueOnce({ error: new Error('Insert Failed') })

            const result = await saveTransactionAction(mockData)

            expect(result).toEqual({ success: false, message: 'Insert Failed' })
        })

        it('handles update error', async () => {
            mockSupabase.eq.mockResolvedValueOnce({ error: new Error('Update Failed') })

            const result = await saveTransactionAction(mockData, '123')

            expect(result).toEqual({ success: false, message: 'Update Failed' })
        })
    })

    describe('updateTransactionAction', () => {
        it('updates transaction fields successfully', async () => {
            const updates = { amount: 500 }
            mockSupabase.eq.mockResolvedValueOnce({ error: null })

            const result = await updateTransactionAction('123', updates)

            expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                amount: 500,
                updated_at: expect.any(String)
            }))
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123')
            expect(result).toEqual({ success: true })
        })

        it('handles update error', async () => {
            mockSupabase.eq.mockResolvedValueOnce({ error: new Error('Partial Update Error') })

            const result = await updateTransactionAction('123', { amount: 500 })

            expect(result).toEqual({ success: false, error: 'Falha ao atualizar o registro.' })
        })
    })
})
