use advent_of_code::day_four;

#[test]
fn always_increasing() {
    let digits: Vec<u32> = vec![1, 2, 3];
    assert_eq!(true, day_four::rule_three(&digits));
    assert_eq!(true, day_four::rule_three(&digits));
    assert_eq!(true, day_four::rule_three(&digits));
}
