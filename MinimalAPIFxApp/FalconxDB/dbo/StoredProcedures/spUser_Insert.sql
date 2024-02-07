CREATE PROCEDURE [dbo].[spUser_Insert]
	@FirstName NVARCHAR(50),
	@LastName NVARCHAR(50)
AS
BEGIN
	INSERT INTO dbo.[User] (FirstName, LastName)
	VALUES (@FirstName, @LastName);
END