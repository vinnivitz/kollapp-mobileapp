import 'package:flutter/material.dart';
import '../widgets/locale_switcher.dart';

class Layout extends StatelessWidget {
  final Widget child;

  const Layout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  height: 60,
                ),
                const LocaleSwitcher(),
              ],
            ),
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}
