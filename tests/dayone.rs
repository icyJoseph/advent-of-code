use advent_of_code::day_one;

#[test]
fn calc_fuel_for_mass() {
    assert_eq!(4, day_one::calc_fuel_for_mass(20));
    assert_eq!(654, day_one::calc_fuel_for_mass(1969));
    assert_eq!(33583, day_one::calc_fuel_for_mass(100756));
}

#[test]
fn calc_fuel_for_mass_and_fuel() {
    assert_eq!(2, day_one::calc_fuel_for_mass_and_fuel(14));
    assert_eq!(966, day_one::calc_fuel_for_mass_and_fuel(1969));
    assert_eq!(50346, day_one::calc_fuel_for_mass_and_fuel(100756));
}
