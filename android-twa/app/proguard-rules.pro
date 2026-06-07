# This is a configuration file for ProGuard.
# http://proguard.sourceforge.net/index.html#manual/usage.html

-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep WebView classes
-keep class android.webkit.** { *; }
-keep class * extends android.webkit.WebViewClient { }
-keep class * extends android.webkit.WebChromeClient { }

# Keep our app classes
-keep class com.nutricook.app.** { *; }

# Keep AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**
