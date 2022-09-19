import * as React from 'react';
import {
  AppRegistry,
  Text,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ChunkManager } from '@callstack/repack/client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

ChunkManager.configure({
  forceRemoteChunkResolution: true,
  resolveRemoteChunk: async (chunkId, parentId) => {
    let url;

    switch (parentId) {
      case 'app1':
        url = `http://localhost:9000/${chunkId}.chunk.bundle`;
        break;
      case 'app2':
        url = `http://localhost:9001/${chunkId}.chunk.bundle`;
        break;
      case 'app3':
        url = `http://localhost:9002/${chunkId}.chunk.bundle`;
        break;

      case 'main':
      default:
        url =
          {
            // containers
            app1: 'http://localhost:9000/app1.container.bundle',
            app2: 'http://localhost:9001/app2.container.bundle',
            app3: 'http://localhost:9002/app3.container.bundle',
          }[chunkId] ?? `http://localhost:8081/${chunkId}.chunk.bundle`;
        break;
    }

    return {
      url,
      query: {
        platform: Platform.OS,
      },
      excludeExtension: true,
    };
  },
});

async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  // Download and execute container
  await ChunkManager.loadChunk(scope, 'main');

  const container = self[scope];

  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  const exports = factory();
  return exports;
}

const App1 = React.lazy(() => loadComponent('app1', './App.js'));

const App2 = React.lazy(() => loadComponent('app2', './App.js'));

const App3 = React.lazy(() => loadComponent('app3', './App.js'));

function App1Wrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{ textAlign: 'center' }}>Loading...</Text>}
    >
      <App1 />
    </React.Suspense>
  );
}

function App2Wrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{ textAlign: 'center' }}>Loading...</Text>}
    >
      <App2 />
    </React.Suspense>
  );
}

function App3Wrapper() {
  return (
    <React.Suspense
      fallback={<Text style={{ textAlign: 'center' }}>Loading 3...</Text>}
    >
      <App3 />
    </React.Suspense>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('App1')}
        style={styles.button}
      >
        <Text>App 1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('App2')}
        style={styles.button}
      >
        <Text>App 2</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('App3')}
        style={styles.button}
      >
        <Text>App 3</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export function Root() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="App1" component={App1Wrapper} />
        <Stack.Screen name="App2" component={App2Wrapper} />
        <Stack.Screen name="App3" component={App3Wrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 50,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
  },
});
