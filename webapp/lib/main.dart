import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:webapp/widgets/locale_switcher.dart';
import 'screens/home_screen.dart';
import 'widgets/layout.dart';

void main() {
  runApp(const Webapp());
}

class Webapp extends StatefulWidget {
  const Webapp({super.key});

  @override
  State<Webapp> createState() => _WebappState();
}

class _WebappState extends State<Webapp> {
  Locale _locale = const Locale('en');

  void _updateLocale(Locale newLocale) {
    setState(() {
      _locale = newLocale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return LocaleSettings(
      updateLocale: _updateLocale,
      child: MaterialApp(
        title: 'Kollapp',
        locale: _locale,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)
        ),
        home: const Layout(
          child: HomeScreen(),
        ),
      ),
    );
  }
}
