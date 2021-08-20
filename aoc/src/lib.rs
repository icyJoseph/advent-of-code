use dotenv;
use reqwest;

/// # get_input
///
/// Goes out to advent of code to get input for a given year and day.
///
/// It requires a valid session cookie.
///
/// Take the session cookie from https://adventofcode.com in your preferred
/// browser. In Chrome this can be found in Application inside `devTools`.
///
pub fn get_input(year: u32, day: u32) -> String {
    dotenv::dotenv().ok();

    let session = dotenv::var("SESSION");

    match session {
        Ok(value) => {
            let url = format!("https://adventofcode.com/{}/day/{}/input", year, day);

            let client = reqwest::blocking::Client::new();

            let response = client
                .get(url)
                .header("Cookie", format!("session={}", value))
                .send();

            match response {
                Ok(res) => match res.text() {
                    Ok(txt) => txt,
                    Err(_) => panic!("Error reading response"),
                },
                Err(_) => panic!("Failed to get"),
            }
        }
        Err(_) => panic!("Session cookie is missing"),
    }
}
