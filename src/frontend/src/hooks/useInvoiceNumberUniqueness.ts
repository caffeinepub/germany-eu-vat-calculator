// Hook for checking invoice number uniqueness

import { useActor } from './useActor';

export function useInvoiceNumberUniqueness() {
  const { actor } = useActor();

  const checkUniqueness = async (invoiceNumber: string): Promise<boolean> => {
    if (!actor) return false;
    
    try {
      return await actor.doesInvoiceNumberExist(invoiceNumber);
    } catch (error) {
      // If not authenticated or error, don't block
      return false;
    }
  };

  return { checkUniqueness };
}
