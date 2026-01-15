export const GlobalHelper = {
    getCsrfToken: (): string => {
         return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
}