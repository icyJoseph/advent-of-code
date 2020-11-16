#[derive(Debug, Clone, Copy)]
enum Pixel {
    Black,
    White,
    Transparent,
}

fn resolve_to_pixel(value: char) -> Pixel {
    match value {
        '0' => Pixel::Black,
        '1' => Pixel::White,
        _ => Pixel::Transparent,
    }
}

fn pretty_print(image: Vec<Vec<Pixel>>) -> String {
    let mut buffer = String::new();
    for row in image {
        let output: Vec<char> = row
            .iter()
            .map(|x| match x {
                Pixel::White => '*',
                _ => ' ',
            })
            .collect();
        let to_print: String = output.iter().collect();

        buffer.push_str(&to_print);
        buffer.push('\n');
    }

    println!("{}", buffer);
    return buffer;
}

pub fn decode_stream(raw_data: String, width: &usize, height: &usize) -> String {
    let stream: Vec<Pixel> = raw_data.chars().map(|x| resolve_to_pixel(x)).collect();
    let size = width * height;

    let mut image: Vec<Vec<Pixel>> = vec![vec![Pixel::Transparent; *width]; *height];

    for pixel in 0..stream.len() {
        let layer = pixel / size;
        let col = pixel % *width;
        let row = (pixel - layer * size) / (*width);

        let _row = image.get(row).unwrap();
        let _cell = _row.get(col).unwrap();

        let value = match _cell {
            Pixel::Black => &Pixel::Black,
            Pixel::White => &Pixel::White,
            _ => stream.get(pixel).unwrap(),
        };

        image[row][col] = *value;
    }
    return pretty_print(image);
}
