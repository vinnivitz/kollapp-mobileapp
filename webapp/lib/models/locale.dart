enum LocaleCode {
  en,
  de;

  String get description {
    switch (this) {
      case LocaleCode.en:
        return 'en';
      case LocaleCode.de:
        return 'de';
    }
  }
}