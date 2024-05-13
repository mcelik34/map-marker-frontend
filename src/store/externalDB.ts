import { configureStore } from "@reduxjs/toolkit";
import {
    createApi,
    fetchBaseQuery,
    setupListeners
} from "@reduxjs/toolkit/query/react";

export interface Marker {
    id: number,
    lat: number,
    lng: number,
    datetime: string
}

interface ListResponse<T> {
    page: number
    limit: number
    total: number
    total_pages: number
    data: T[]
}

const markerApi = createApi({
    reducerPath: "markerApi",
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }),
    tagTypes: ['Marker'],
    endpoints: (build) => ({
        readMarkers: build.query<ListResponse<Marker>, { page?: number, limit?: number, sortBy?: string }>({
            query: ({ page = 1, limit = 100, sortBy }) => {
                const query = new URLSearchParams("");
                query.append('page', page.toString())
                query.append('limit', limit.toString())
                if (sortBy) query.append('sortBy', sortBy)

                return `marker${query.size && ("?" + query.toString())}`
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Marker' as const, id })),
                        { type: 'Marker', id: 'LIST' },
                    ]
                    : [{ type: 'Marker', id: 'LIST' }],
        }),
        addMarker: build.mutation<Marker, Partial<Marker>>({
            query: (body) => ({
                url: `marker`,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Marker', id: 'LIST' }],
        }),
        deleteMarker: build.mutation<{ id: number }, number>({
            query(id) {
                return {
                    url: `marker/${id}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: (result, error, id) => [{ type: 'Marker', id }],
        }),
    }),
})

export const externalStore = configureStore({
    reducer: {
        [markerApi.reducerPath]: markerApi.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            markerApi.middleware,
        ),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(externalStore.dispatch);

export type RootState = ReturnType<typeof externalStore.getState>;
export type AppDispatch = typeof externalStore.dispatch;
export const { useAddMarkerMutation, useDeleteMarkerMutation, useLazyReadMarkersQuery, useReadMarkersQuery, usePrefetch } = markerApi