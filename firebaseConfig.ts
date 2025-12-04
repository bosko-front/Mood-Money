// firebaseConfig.ts
// Configure React Native Firebase using native configuration files.
// No manual JS initialization or persistence setup is required with v23+.
import firestore from '@react-native-firebase/firestore';
import authModule from '@react-native-firebase/auth';

// In some Release builds (e.g., Xcode Archive), Metro may evaluate this module
// before the native default Firebase app is fully bootstrapped. Creating module
// instances (firestore(), auth()) too early can throw:
// "No Firebase App '[DEFAULT]' has been created".
// To avoid that, lazily create the instances on first use while keeping the
// same API shape (db.collection(...), auth.createUserWithEmailAndPassword(...)).

let _db: ReturnType<typeof firestore> | null = null;
let _auth: ReturnType<typeof authModule> | null = null;

// Helper to create a property-forwarding Proxy around a lazily-initialized target
function lazyProxy<T extends object>(getTarget: () => T): T {
  return new Proxy({} as T, {
    get(_obj, prop, receiver) {
      const target = getTarget();
      // @ts-expect-error dynamic property forwarding
      const value = (target as any)[prop];
      // If the property is a function, bind it to the target to preserve 'this'
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    },
    has(_obj, prop) {
      const target = getTarget();
      return prop in target;
    },
    ownKeys() {
      const target = getTarget();
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_obj, prop) {
      const target = getTarget();
      const desc = Object.getOwnPropertyDescriptor(target, prop);
      if (desc) {
        desc.configurable = true;
      }
      return desc;
    },
  });
}

export const db = lazyProxy(() => (_db ?? (_db = firestore())));
export const auth = lazyProxy(() => (_auth ?? (_auth = authModule())));


