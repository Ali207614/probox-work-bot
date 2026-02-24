import i18n from 'i18n';
import path from 'path';

i18n.configure({
  locales: ['uz', 'ru'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'uz',
  objectNotation: true,
});

export default i18n;
