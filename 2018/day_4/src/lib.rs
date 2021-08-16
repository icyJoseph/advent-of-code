#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_date() {
        let raw_spec = "[1518-11-02 00:50] wakes up";
        let date = Date::new(raw_spec);
        assert_eq!(date.year, 1518);
        assert_eq!(date.month, 11);
        assert_eq!(date.day, 2);
        assert_eq!(date.hour, 0);
        assert_eq!(date.minute, 50);
    }

    #[test]
    fn cmp_dates() {
        assert_eq!(
            Date::new("[1518-11-02 00:50] wakes up").cmp(&Date::new("[1518-11-02 00:50] wakes up")),
            std::cmp::Ordering::Equal
        );
    }

    #[test]
    fn sort_date() {
        let mut inputs = vec![];

        inputs.push("[1518-11-02 00:50] wakes up");
        inputs.push("[1519-11-02 00:50] wakes up");
        inputs.push("[1516-11-02 00:50] wakes up");
        inputs.push("[1518-12-02 00:50] wakes up");
        inputs.push("[1518-10-02 00:50] wakes up");
        inputs.push("[1518-11-01 00:50] wakes up");
        inputs.push("[1518-11-03 00:50] wakes up");
        inputs.push("[1518-11-02 01:50] wakes up");
        inputs.push("[1518-11-02 00:51] wakes up");

        let mut to_sort = inputs.iter().map(|x| Date::new(x)).collect::<Vec<Date>>();
        to_sort.sort_by(|a, b| a.cmp(&b));

        assert_eq!(
            vec![
                "1516-11-02 00:50",
                "1518-10-02 00:50",
                "1518-11-01 00:50",
                "1518-11-02 00:50",
                "1518-11-02 00:51",
                "1518-11-02 01:50",
                "1518-11-03 00:50",
                "1518-12-02 00:50",
                "1519-11-02 00:50",
            ],
            to_sort
                .iter()
                .map(|x| format!("{:?}", x))
                .collect::<Vec<String>>()
        );
    }
}

#[derive(Eq, Copy, Clone)]
struct Date {
    year: u64,
    month: u64,
    day: u64,
    hour: u64,
    minute: u64,
}

impl Date {
    fn new(raw_spec: &str) -> Self {
        let spec = raw_spec.split("] ").collect::<Vec<&str>>();

        let wrapped_date = spec[0].replace("[", "");

        let time_spec = wrapped_date.split(" ").collect::<Vec<&str>>();

        let date = time_spec[0]
            .split("-")
            .collect::<Vec<&str>>()
            .iter()
            .map(|x| x.parse::<u64>().unwrap())
            .collect::<Vec<u64>>();

        let time = time_spec[1]
            .split(":")
            .collect::<Vec<&str>>()
            .iter()
            .map(|x| x.parse::<u64>().unwrap())
            .collect::<Vec<u64>>();

        return Date {
            year: date[0],
            month: date[1],
            day: date[2],
            hour: time[0],
            minute: time[1],
        };
    }
}

use std::fmt;

fn fill_zero(num: u64) -> String {
    if num < 10 {
        format!("0{}", num)
    } else {
        format!("{}", num)
    }
}

impl fmt::Debug for Date {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}-{}-{} {}:{}",
            self.year,
            fill_zero(self.month),
            fill_zero(self.day),
            fill_zero(self.hour),
            fill_zero(self.minute)
        )
    }
}

impl PartialEq for Date {
    fn eq(&self, other: &Self) -> bool {
        if self.year != other.year {
            return false;
        }
        if self.month != other.month {
            return false;
        }
        if self.day != other.day {
            return false;
        }
        if self.hour != other.hour {
            return false;
        }
        if self.minute != other.minute {
            return false;
        }

        true
    }
}

impl Ord for Date {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        if self.year > other.year {
            return std::cmp::Ordering::Greater;
        }
        if self.year < other.year {
            return std::cmp::Ordering::Less;
        }
        if self.month > other.month {
            return std::cmp::Ordering::Greater;
        }
        if self.month < other.month {
            return std::cmp::Ordering::Less;
        }
        if self.day > other.day {
            return std::cmp::Ordering::Greater;
        }
        if self.day < other.day {
            return std::cmp::Ordering::Less;
        }
        if self.hour > other.hour {
            return std::cmp::Ordering::Greater;
        }
        if self.hour < other.hour {
            return std::cmp::Ordering::Less;
        }
        if self.minute > other.minute {
            return std::cmp::Ordering::Greater;
        }
        if self.minute < other.minute {
            return std::cmp::Ordering::Less;
        }
        return std::cmp::Ordering::Equal;
    }
}

impl PartialOrd for Date {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

pub fn solve(raw_input: String) {
    let start = "begins";
    let sleep = "asleep";
    let awake = "wakes";

    let mut dates = raw_input
        .trim()
        .split("\n")
        .collect::<Vec<&str>>()
        .iter()
        .map(|inst| (Date::new(inst), inst.to_string()))
        .collect::<Vec<(Date, String)>>();

    dates.sort_by(|a, b| a.0.cmp(&b.0));

    let mut current = None;

    use std::collections::HashMap;

    let mut shifts: HashMap<&str, Vec<i64>> = HashMap::new();

    for date in &dates {
        if date.1.contains(start) {
            let id = date.1.split("] ").collect::<Vec<&str>>()[1];
            current = Some(id)
        }
        if date.1.contains(sleep) {
            match current {
                Some(id) => {
                    let entry = shifts.entry(id).or_insert(vec![0; 60]);
                    for i in date.0.minute..59 {
                        entry[i as usize] += 1;
                    }
                }
                None => panic!("No id"),
            }
        }

        if date.1.contains(awake) {
            match current {
                Some(id) => {
                    let entry = shifts.entry(id).or_insert(vec![0; 60]);
                    for i in date.0.minute..59 {
                        entry[i as usize] -= 1;
                    }
                }
                None => panic!("No id"),
            }
        }
    }

    let sleepy = match shifts.iter().max_by(|a, b| {
        a.1.iter()
            .filter(|&x| *x > 0)
            .sum::<i64>()
            .cmp(&b.1.iter().filter(|&x| *x > 0).sum::<i64>())
    }) {
        Some(entry) => entry,
        None => panic!("No guard found"),
    };

    let minute =
        match sleepy.1.iter().enumerate().reduce(
            |max, (index, value)| {
                if *value > *max.1 {
                    (index, value)
                } else {
                    max
                }
            },
        ) {
            Some((min, _)) => min,
            None => panic!("No minute found"),
        };

    let id_number = sleepy
        .0
        .replace("Guard #", "")
        .replace(" begins shift", "")
        .parse::<usize>()
        .unwrap();

    println!("Part one: {}", id_number * minute);

    let mut freqs = vec![None; 60];

    for guard in &shifts {
        let id = guard.0;
        let shift = guard.1;

        for i in 0..shift.len() {
            match freqs[i] {
                Some((_, value, minute)) => {
                    if shift[i] > value {
                        freqs[i] = Some((id.to_string(), shift[i], minute));
                    }
                }
                None => {
                    freqs[i] = Some((id.to_string(), shift[i], i));
                }
            }
        }
    }

    let mut most_slept: Option<(String, i64, usize)> = None;

    for freq in freqs {
        match &most_slept {
            Some(m) => match freq {
                Some((id, value, minute)) => {
                    if value > m.1 {
                        most_slept = Some((id, value, minute));
                    }
                }
                None => {}
            },
            None => most_slept = freq,
        }
    }

    match most_slept {
        Some(most_slept_minute) => {
            let id_number = most_slept_minute
                .0
                .replace("Guard #", "")
                .replace(" begins shift", "")
                .parse::<usize>()
                .unwrap();

            println!("Part two: {}", id_number * most_slept_minute.2,);
        }
        None => panic!("Failed to find a most slept minute"),
    }
}
