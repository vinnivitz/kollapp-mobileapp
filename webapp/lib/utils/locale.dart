import 'dart:ui';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

String getLanguageName(Locale locale, AppLocalizations appLocalizations) {
  switch (locale.languageCode) {
    case 'en':
      return appLocalizations.english;
    case 'de':
      return appLocalizations.german;
    default:
      return locale.languageCode.toUpperCase();
  }
}
