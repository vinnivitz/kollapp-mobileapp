import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:webapp/utils/locale.dart';

class LocaleSwitcher extends StatelessWidget {
  const LocaleSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final supportedLocales = AppLocalizations.supportedLocales;
    final appLocalizations = AppLocalizations.of(context)!;

    return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: DropdownButtonHideUnderline(
            child: DropdownButton2<Locale>(
          value: Localizations.localeOf(context),
          items: supportedLocales.map((locale) {
            final language = getLanguageName(locale, appLocalizations);
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
          },
          customButton: Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const Icon(Icons.language),
                  const SizedBox(width: 8.0),
                  Text(getLanguageName(
                      Localizations.localeOf(context), appLocalizations)),
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
