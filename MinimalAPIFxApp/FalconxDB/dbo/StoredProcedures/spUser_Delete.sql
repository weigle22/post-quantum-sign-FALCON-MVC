CREATE PROCEDURE [dbo].[spUser_Delete]
	@Id INT
AS
BEGIN
	DELETE
	FROM dbo.[User]
	WHERE Id = @id;
END

