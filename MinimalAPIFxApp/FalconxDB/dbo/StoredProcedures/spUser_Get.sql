CREATE PROCEDURE [dbo].[spUser_Get]
	@Id INT
AS
BEGIN
	SELECT Id, FirstName, LastName
	FROM dbo.[User]
	WHERE Id = @id;
END
