import { ClusterMarker } from "../markers/ClusterMarker";

interface ClusterLayerProps {
    clusters?: any[];
}

export function ClusterLayer({ clusters }: ClusterLayerProps) {
    if (!clusters) return null;

    return (
        <>
            {clusters.map((cluster) => (
                <ClusterMarker
                    key={cluster.geohash}
                    cluster={cluster}
                    onClick={() => console.log('Cluster clicked', cluster.name)}
                />
            ))}
        </>
    );
}
