import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:dropdown_button2/dropdown_button2.dart';

class LocaleSwitcher extends StatelessWidget {
  const LocaleSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final supportedLocales = AppLocalizations.supportedLocales;
    final appLocalizations = AppLocalizations.of(context)!;

    String getLanguageName(Locale locale) {
      switch (locale.languageCode) {
        case 'en':
          return appLocalizations.english;
        case 'de':
          return appLocalizations.german;
        default:
          return locale.languageCode.toUpperCase();
      }
    }

    return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: DropdownButtonHideUnderline(
            child: DropdownButton2<Locale>(
          value: Localizations.localeOf(context),

          // icon: const Icon(Icons.language),
          // padding: const EdgeInsets.symmetric(horizontal: 8.0),
          items: supportedLocales.map((locale) {
            final language = getLanguageName(locale);
            return DropdownMenuItem(
              value: locale,
              alignment: Alignment.center,
              child: Text(language),
            );
          }).toList(),
          onChanged: (Locale? newLocale) {
            if (newLocale != null) {
              LocaleSettings.of(context).updateLocale(newLocale);
            }
            FocusScope.of(context).requestFocus(FocusNode());
          },
          customButton: Padding(
            padding: EdgeInsets.all(8.0),
              child: Row(
            children: [
              const Icon(Icons.language),
              const SizedBox(width: 8.0),
              Text(getLanguageName(Localizations.localeOf(context))),
            ],
          )),
        )));
  }
}

class LocaleSettings extends InheritedWidget {
  final Function(Locale) updateLocale;

  const LocaleSettings({
    super.key,
    required this.updateLocale,
    required super.child,
  });

  static LocaleSettings of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<LocaleSettings>()!;
  }

  @override
  bool updateShouldNotify(LocaleSettings oldWidget) => false;
}
