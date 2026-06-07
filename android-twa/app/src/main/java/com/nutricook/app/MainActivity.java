package com.nutricook.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * NutriCook - WebView Activity
 * Carga la app web desde GitHub Pages.
 */
public class MainActivity extends Activity {

    private static final String APP_URL = "https://jfsaints.github.io/nutricook/";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Full screen sin ActionBar
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        // Status bar transparente en Android 5+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#0e0e12"));
        }

        // Crear WebView
        webView = new WebView(this);

        // Configurar WebView settings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setSupportZoom(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Mejorar rendimiento
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Client para manejar navegación
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Links externos se abren en navegador
                if (!url.startsWith("https://jfsaints.github.io/nutricook")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                    } catch (Exception e) {
                        // Si no hay app para abrir el link, ignorar
                    }
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Ocultar barra de sistema al cargar
                hideSystemUI();
            }
        });

        // Chrome client para consola JS y permisos
        webView.setWebChromeClient(new WebChromeClient());

        // Habilitar WebView debugging en debug builds
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        // Cargar la app
        setContentView(webView);
        webView.loadUrl(APP_URL);
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            // Android < 11
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        hideSystemUI();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.clearHistory();
            webView.removeAllViews();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
