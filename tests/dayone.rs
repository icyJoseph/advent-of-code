use advent_of_code;

#[test]
fn calc_fuel_for_mass() {
    assert_eq!(4, advent_of_code::calc_fuel_for_mass(20));
    assert_eq!(654, advent_of_code::calc_fuel_for_mass(1969));
    assert_eq!(33583, advent_of_code::calc_fuel_for_mass(100756));
}

#[test]
fn calc_fuel_for_mass_and_fuel() {
    assert_eq!(2, advent_of_code::calc_fuel_for_mass_and_fuel(14));
    assert_eq!(966, advent_of_code::calc_fuel_for_mass_and_fuel(1969));
    assert_eq!(50346, advent_of_code::calc_fuel_for_mass_and_fuel(100756));
}
