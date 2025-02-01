Objective :

Please write one page website:
Website name is: "click fit".
The website will be a sport website, with some fitness things.
Build something that look nice.
Make couple of animation in the design that will look nice to the user.
The UI need to be responsive, to develop the UI please use only CSS, Javascript, HTML, Bootstrap, JQuery and JQuery plugins.
On the main page, after the load add jquery ajax call to this rest interface http://numbersapi.com/1/30/date?json get the content and write the text to the page plus write this information to some area in the page.
Add a place in the main page that you can drag and drop images or click on it, and then you can upload images to the server, please write the backend part in Nodejs, and do not use any cloud solution for it just upload it to a "upload_images" folder in the root of the project .
We do not care about the text of the website it is just to see your skills set.
It is OK that only the main page will work, and any click on other link in the main page will show error.

Backend and MySQL task please create a script with:
Creation of users table with columns:
`ID` INT NOT NULL AUTO_INCREMENT
`email` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL
`password` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL
`type` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL
`active` TINYINT default 1

Create stored procedure `addUser` to instert new user + write call to stored procedure `addUser` that will insert new user
