use advent_of_code::day_two;

#[test]
fn small_programs() {
    let programs: Vec<String> = [
        "1,0,0,0,99",
        "2,3,0,3,99",
        "2,4,4,5,99,0",
        "1,1,1,4,99,5,6,0,99",
    ]
    .iter()
    .map(|x| x.to_string())
    .collect();

    let expected = vec![
        "2,0,0,0,99",
        "2,3,0,6,99",
        "2,4,4,5,99,9801",
        "30,1,1,4,2,5,6,0,99",
    ];

    let results: Vec<String> = programs
        .iter()
        .map(|program| {
            day_two::join(
                day_two::write(day_two::parse(&day_two::segment(program))),
                None,
            )
        })
        .collect();

    assert_eq!(expected, results);
}

#[test]
fn replace_before() {
    let program = String::from("1,0,0,5,99,5,6,0,99,0,0,0,0,0,0,0,0");
    let segment = day_two::segment(&program);
    assert_eq!(
        "1,12,2,5,99,2,6,0,99,0,0,0,0,0,0,0,0",
        day_two::join(
            day_two::write(day_two::replace(day_two::parse(&segment), 12, 2)),
            None
        )
    );
}

#[test]
fn program_halts() {
    let program = String::from("1,0,0,0,99,5,6,0,99,0,0,0,0,0,0,0,0");
    let segment = day_two::segment(&program);
    assert_eq!(
        "2,0,0,0,99,5,6,0,99,0,0,0,0,0,0,0,0",
        day_two::join(day_two::write(day_two::parse(&segment)), None)
    );
}

#[test]
fn long_example() {
    let program = String::from("1,9,10,3,2,3,11,0,99,30,40,50");
    let segment = day_two::segment(&program);
    assert_eq!(
        "3500,9,10,70,2,3,11,0,99,30,40,50",
        day_two::join(day_two::write(day_two::parse(&segment)), None)
    )
}
