import { translateText } from './translate';

export const translateCMSField = async (
  text: string, 
  setLoading: (l: boolean) => void,
  onSuccess: (translated: string) => void
) => {
  if (!text) return;
  setLoading(true);
  try {
    const translated = await translateText(text, { from: 'en', to: 'ar' });
    if (translated && translated !== text) {
      onSuccess(translated);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
