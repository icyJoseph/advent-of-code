/**
 * Fuel required to launch a given module is based on its mass.
 * Specifically, to find the fuel required for a module,
 * take its mass, divide by three, round down, and subtract 2.
 *
 */

pub fn calc_fuel_for_mass(mass: i32) -> i32 {
    (mass / 3) - 2
}

pub fn calc_fuel_for_mass_and_fuel(mass: i32) -> i32 {
    let fuel = calc_fuel_for_mass(mass);
    if fuel <= 0 {
        return 0;
    }
    return fuel + calc_fuel_for_mass_and_fuel(fuel);
}
