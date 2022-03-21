use server::ThreadPool;
use std::io::prelude::*;
use std::fs;
use std::path::Path;
use std::net::TcpListener;
use std::net::TcpStream;
use std::str; //for testing

fn main() {
    let listener = TcpListener::bind("0.0.0.0:80").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let mut status_line: String = String::from("");
    let mut path: String = String::from("");

    //path
    let mut bufparse = std::str::from_utf8(&buffer).unwrap().split(' ').nth(1).unwrap();
    //println!("Buffer: {:?}, Bufparse: {}|", str::from_utf8(&buffer).unwrap(), bufparse);
    if bufparse == "/"{
        bufparse = "/index.html";
    }
    // ridiculous syntax for string concatenation
    let bufparse = ["src/site".to_owned(),bufparse.to_owned()].join("");
    //println!("{}", bufparse);
    if buffer.starts_with(b"GET"){
            if Path::new(&bufparse.to_string()).exists() {
                status_line = "HTTP/1.1 200 OK".to_string();
                path = bufparse.to_string();
            } else {
                status_line ="HTTP/1.1 404 NOT FOUND".to_string();
                path = "src/site/404.html".to_owned();
            }
    }
    
    let contents = match fs::read(path){
        Ok(path) => path,
        Err(_) => String::from("/").as_bytes().to_vec()
    };    
    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n",
        status_line,
        contents.len()
    );

    stream.write(response.as_bytes()).unwrap();
    stream.write(&contents).unwrap();
    stream.flush().unwrap();
}
