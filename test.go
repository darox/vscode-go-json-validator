package main

import "fmt"

func main() {
	// Valid JSON strings
	validJson1 := "{\"name\": \"John Doe\", \"age\": 30, \"email\": \"johndoe@example.com\"}"
	validJson2 := `{
        "name": "John Doe",
        "age": 30,
        "email": "johndoe@example.com",
        "address": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY"
        },
        "interests": [
            "programming",
            "reading",
            "traveling"
        ]
    }`
	validJson3 := `{"numbers": [1, 2, 3, 4, 5], "boolean": true, "nullValue": null}`
	validJson4 := `{"nested": {"level1": {"level2": {"level3": "deep"}}}}`
	validJson5 := `{"arrayOfObjects": [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]}`

	// Invalid JSON strings
	invalidJson1 := "{\"name\": \"John Doe\", \"age\": 30, \"email\": johndoe@example.com\"}"
	invalidJson2 := `{
        "name": "John Doe",
        "age": 30,
        "email": "johndoe@example.com",
        "address": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY"
        "interests": [
            "programming",
            "reading",
            "traveling"
        ]
    }`
	invalidJson3 := `{"missingComma": "value1" "value2"}`
	invalidJson4 := `{"unclosedBrace": {"key": "value"}`
	invalidJson5 := `{"extraComma": ["item1", "item2",]}`

	// Regular Go strings (should not be identified as JSON)
	fmt.Println(`This is a regular string with backticks`)
	fmt.Println("Another regular string with \"escaped quotes\"")
}
