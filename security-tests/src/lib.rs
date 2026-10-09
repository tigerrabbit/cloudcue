#![forbid(unsafe_code)]
#[cfg(test)]
mod tests {
    use glib::variant::ToVariant;
    #[test]
    fn glib_optimized_string_iteration() {
        let v = vec!["alpha", "", "écho", "🦀", "omega"].to_variant();
        assert_eq!(
            v.array_iter_str().unwrap().collect::<Vec<_>>(),
            vec!["alpha", "", "écho", "🦀", "omega"]
        );
        assert_eq!(
            v.array_iter_str().unwrap().rev().collect::<Vec<_>>(),
            vec!["omega", "🦀", "écho", "", "alpha"]
        );
        assert_eq!(v.array_iter_str().unwrap().nth(2), Some("écho"));
        assert_eq!(v.array_iter_str().unwrap().nth_back(1), Some("🦀"));
        assert_eq!(v.array_iter_str().unwrap().last(), Some("omega"));
        let empty: Vec<&str> = vec![];
        assert_eq!(empty.to_variant().array_iter_str().unwrap().next(), None);
        assert!(42u32.to_variant().array_iter_str().is_err());
    }
}
