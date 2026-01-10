import { DriverMarker } from "../markers/DriverMarker";

interface DriverLayerProps {
    drivers?: any[];
}

export function DriverLayer({ drivers }: DriverLayerProps) {
    if (!drivers || drivers.length === 0) return null;

    return (
        <>
            {drivers.map((driver) => (
                <DriverMarker
                    key={driver.driver_id}
                    driver={driver}
                    onClick={() => console.log('Driver clicked', driver.handle)}
                />
            ))}
        </>
    );
}
