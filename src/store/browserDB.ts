import { IDBPDatabase, openDB } from 'idb';
import { MarkerJsonElemType } from '../sidebar/MarkerCards.list';

export let DB: Promise<IDBPDatabase<unknown> | undefined>;

function coldStart() {
    if (!('indexedDB' in window)) {
        console.log("This browser doesn't support IndexedDB");
    } else {
        DB = useDB()
    }
}

coldStart();

export async function useDB() {
    try {
        const db = await openDB('map', 1, {
            upgrade(db) {
                console.log('Creating a new object store...');

                // Checks if the object store exists:
                if (!db.objectStoreNames.contains('markers')) {
                    // If the object store does not exist, create it:
                    db.createObjectStore('marker', { keyPath: 'id', autoIncrement: false });
                }
            }
        })
        return await new Promise<IDBPDatabase<unknown>>((resolve, reject) => {
            setTimeout(() => {
                //if (Math.random() > 0.1)
                resolve(db);
                //else reject()
            }, 500);
        })

    } catch (error) {
        console.log("Couldn't open IndexedDB")
        return;
    }
}

export async function add(markers: MarkerJsonElemType[]) {
    try {
        const db = await DB
        if (!db) throw Error("no db");

        // Create a transaction on the 'foods' store in read/write mode:
        const tx = db.transaction('marker', 'readwrite');

        // Add multiple items to the 'foods' store in a single transaction:
        return await Promise.all([
            ...markers.map(m => tx.store.put(m)),
            tx.done
        ]);
    } catch (error) {
        console.log("idb: ", error)

    }

}

export async function read() {
    try {
        const db = await DB;
        if (!db) throw Error("no db");

        // Get a value from the object store by its primary key value:
        return await db.getAll('marker')
    } catch (error) {
        console.log("idb: ", error)
    }
}

export async function remove(markerIds: number[]) {
    try {
        const db = await DB;
        if (!db) throw Error("no db");

        // Create a transaction on the 'foods' store in read/write mode:
        const tx = db.transaction('marker', 'readwrite');

        // Add multiple items to the 'foods' store in a single transaction:
        return await Promise.all([
            ...markerIds.map(id => tx.store.delete(id)),
            tx.done
        ]);
    } catch (error) {
        console.log("idb: ", error)
        return []
    }

}

export default { add, remove, read }