use advent_of_code::day_two;

#[test]
fn small_programs() {
    assert_eq!(
        "2,0,0,0,99",
        day_two::join(day_two::write(day_two::parse(&String::from("1,0,0,0,99"))))
    );
    assert_eq!(
        "2,3,0,6,99",
        day_two::join(day_two::write(day_two::parse(&String::from("2,3,0,3,99"))))
    );
    assert_eq!(
        "2,4,4,5,99,9801",
        day_two::join(day_two::write(day_two::parse(&String::from(
            "2,4,4,5,99,0"
        ))))
    );
    assert_eq!(
        "30,1,1,4,2,5,6,0,99",
        day_two::join(day_two::write(day_two::parse(&String::from(
            "1,1,1,4,99,5,6,0,99"
        ))))
    );
}

#[test]
fn replace_before() {
    assert_eq!(
        "1,12,2,5,99,2,6,0,99,0,0,0,0,0,0,0,0",
        day_two::join(day_two::write(day_two::replace(
            day_two::parse(&String::from("1,0,0,5,99,5,6,0,99,0,0,0,0,0,0,0,0")),
            12,
            2
        )))
    );
}

#[test]
fn program_halts() {
    assert_eq!(
        "2,0,0,0,99,5,6,0,99,0,0,0,0,0,0,0,0",
        day_two::join(day_two::write(day_two::parse(&String::from(
            "1,0,0,0,99,5,6,0,99,0,0,0,0,0,0,0,0"
        ))))
    );
}

#[test]
fn long_example() {
    assert_eq!(
        "3500,9,10,70,2,3,11,0,99,30,40,50",
        day_two::join(day_two::write(day_two::parse(&String::from(
            "1,9,10,3,2,3,11,0,99,30,40,50"
        ))))
    )
}
