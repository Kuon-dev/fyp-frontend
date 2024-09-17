#!/usr/bin/env nu

def main [] {
    # Read the .env file
    let env_content = (open .env | lines)
    
    # Process each line
    let example_content = ($env_content | each { |line|
        if ($line | str starts-with '#') {
            # Keep comments as is
            $line
        } else if ($line | str contains '=') {
            # For key-value pairs, keep the key and replace the value with a placeholder
            let parts = ($line | split row '=')
            let key = ($parts | first)
            $"($key)=your_value_here"
        } else {
            # Keep empty lines or lines without '=' as is
            $line
        }
    })
    
    # Write the processed content to .env.example
    $example_content | str join (char newline) | save .env.example
    
    print "Created .env.example file based on your .env file."
}

main
