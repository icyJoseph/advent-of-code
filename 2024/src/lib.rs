use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, AttributeArgs, Ident, ItemFn, Lit, NestedMeta};

#[proc_macro_attribute]
pub fn main(args: TokenStream, input: TokenStream) -> TokenStream {
    let input_path = match &parse_macro_input!(args as AttributeArgs)[..] {
        [NestedMeta::Lit(Lit::Int(day))] => format!("../../input/{}.in", day.token()),
        _ => panic!("Expected one integer argument"),
    };

    let mut aoc_solution = parse_macro_input!(input as ItemFn);
    aoc_solution.sig.ident = Ident::new("aoc_solution", aoc_solution.sig.ident.span());

    let tokens = quote! {
      const INPUT: &str = include_str!(#input_path);

      #aoc_solution
      fn main() {
        let now = ::std::time::Instant::now();
        let (p1, p2) = aoc_solution(INPUT.trim_end());
        let time = now.elapsed();
        println!("\n");
        println!("Part one: {p1}");
        println!("Part two: {p2}");
        println!("\n");
        println!("Time: {time:?}");
      }
    };

    TokenStream::from(tokens)
}
