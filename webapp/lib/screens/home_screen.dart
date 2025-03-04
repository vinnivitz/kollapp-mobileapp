import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appLocalizations = AppLocalizations.of(context)!;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            appLocalizations.downloadTitle,
            style: const TextStyle(fontSize: 44, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16),
          SizedBox(
              width: 500,
              child: Wrap(
                spacing: 8,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      _launchUrl(
                          'https://play.google.com/store/apps/details?id=org.kollapp.app');
                    },
                    icon: const Icon(Icons.android),
                    label: Text(appLocalizations.playStore),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      _launchUrl('https://apps.apple.com/app/id123456789');
                    },
                    icon: const Icon(Icons.apple),
                    label: Text(appLocalizations.appStore),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      _launchUrl(
                          'https://apk.kollapp.org');
                    },
                    icon: const Icon(Icons.download),
                    label: Text(appLocalizations.downloadAPK),
                  ),
                ],
              )),
        ],
      ),
    );
  }

  void _launchUrl(String url) {
    final Uri uri = Uri.parse(url);
    launchUrl(uri);
  }
}
