# @capacitor-yesflow/speech

Used to bridge speech to text for web, ios, and android

## Install

```bash
npm install @capacitor-yesflow/speech
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`available()`](#available)
* [`getCurrentState()`](#getcurrentstate)
* [`getLastResult()`](#getlastresult)
* [`start(...)`](#start)
* [`stop()`](#stop)
* [`restart()`](#restart)
* [`getSupportedLanguages()`](#getsupportedlanguages)
* [`hasPermission()`](#haspermission)
* [`requestPermission()`](#requestpermission)
* [`addListener(...)`](#addlistener)
* [`addListener(...)`](#addlistener)
* [`addListener(...)`](#addlistener)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### available()

```typescript
available() => Promise<{ available: boolean; }>
```

**Returns:** <code>Promise&lt;{ available: boolean; }&gt;</code>

--------------------


### getCurrentState()

```typescript
getCurrentState() => Promise<{ state: string; }>
```

**Returns:** <code>Promise&lt;{ state: string; }&gt;</code>

--------------------


### getLastResult()

```typescript
getLastResult() => Promise<{ result: any; }>
```

**Returns:** <code>Promise&lt;{ result: any; }&gt;</code>

--------------------


### start(...)

```typescript
start(options?: UtteranceOptions | undefined) => Promise<void>
```

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#utteranceoptions">UtteranceOptions</a></code> |

--------------------


### stop()

```typescript
stop() => Promise<void>
```

--------------------


### restart()

```typescript
restart() => Promise<void>
```

--------------------


### getSupportedLanguages()

```typescript
getSupportedLanguages() => Promise<{ languages: any[]; }>
```

**Returns:** <code>Promise&lt;{ languages: any[]; }&gt;</code>

--------------------


### hasPermission()

```typescript
hasPermission() => Promise<{ permission: boolean; }>
```

**Returns:** <code>Promise&lt;{ permission: boolean; }&gt;</code>

--------------------


### requestPermission()

```typescript
requestPermission() => Promise<void>
```

--------------------


### addListener(...)

```typescript
addListener(eventName: 'speechResults', listenerFunc: SpeechResultListener) => Promise<PluginListenerHandle> & PluginListenerHandle
```

| Param              | Type                                                       |
| ------------------ | ---------------------------------------------------------- |
| **`eventName`**    | <code>"speechResults"</code>                               |
| **`listenerFunc`** | <code>(event: SpeechResultListenerEvent) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt; & <a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(...)

```typescript
addListener(eventName: 'speechStateUpdate', listenerFunc: SpeechStateListener) => Promise<PluginListenerHandle> & PluginListenerHandle
```

| Param              | Type                                                      |
| ------------------ | --------------------------------------------------------- |
| **`eventName`**    | <code>"speechStateUpdate"</code>                          |
| **`listenerFunc`** | <code>(state: SpeechStateListenerEvent) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt; & <a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(...)

```typescript
addListener(eventName: 'micVisualizationUpdate', listenerFunc: MicStateListener) => Promise<PluginListenerHandle> & PluginListenerHandle
```

| Param              | Type                                                   |
| ------------------ | ------------------------------------------------------ |
| **`eventName`**    | <code>"micVisualizationUpdate"</code>                  |
| **`listenerFunc`** | <code>(event: MicStateListenerEvent) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt; & <a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------


### Interfaces


#### UtteranceOptions

| Prop                           | Type                 |
| ------------------------------ | -------------------- |
| **`language`**                 | <code>string</code>  |
| **`maxResults`**               | <code>number</code>  |
| **`prompt`**                   | <code>string</code>  |
| **`popup`**                    | <code>boolean</code> |
| **`partialResults`**           | <code>boolean</code> |
| **`sendVisualizationUpdates`** | <code>boolean</code> |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>
