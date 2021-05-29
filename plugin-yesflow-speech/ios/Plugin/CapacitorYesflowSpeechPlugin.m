#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(CapacitorYesflowSpeechPlugin, "CapacitorYesflowSpeech",
        CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(available, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(start, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(restart, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(getSupportedLanguages, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(hasPermission, CAPPluginReturnPromise);
        CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
)
