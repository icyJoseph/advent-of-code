use std::fs;

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

pub fn day_one(filename: &str) -> i32 {
    let masses = fs::read_to_string(filename).expect("Error reading input");
    masses
        .split_terminator("\n")
        .map(|x| x.parse::<i32>().unwrap())
        .fold(0, |acc, x| acc + calc_fuel_for_mass_and_fuel(x))
}
