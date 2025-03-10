﻿/*
Deployment script for FLCNX_DB

This code was generated by a tool.
Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.
*/

GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
:setvar DatabaseName "FLCNX_DB"
:setvar DefaultFilePrefix "FLCNX_DB"
:setvar DefaultDataPath "C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\"
:setvar DefaultLogPath "C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\"

GO
:on error exit
GO
/*
Detect SQLCMD mode and disable script execution if SQLCMD mode is not supported.
To re-enable the script after enabling SQLCMD mode, execute the following:
SET NOEXEC OFF; 
*/
:setvar __IsSqlCmdEnabled "True"
GO
IF N'$(__IsSqlCmdEnabled)' NOT LIKE N'True'
    BEGIN
        PRINT N'SQLCMD mode must be enabled to successfully execute this script.';
        SET NOEXEC ON;
    END


GO
USE [$(DatabaseName)];


GO
PRINT N'The following operation was generated from a refactoring log file bc3b0514-ec18-4842-9c5d-5688eb3ff836';

PRINT N'Rename [dbo].[User].[FistName] to FirstName';


GO
EXECUTE sp_rename @objname = N'[dbo].[User].[FistName]', @newname = N'FirstName', @objtype = N'COLUMN';


GO
PRINT N'Altering Procedure [dbo].[spUser_Get]...';


GO
ALTER PROCEDURE [dbo].[spUser_Get]
	@Id INT
AS
BEGIN
	SELECT Id, FirstName, LastName
	FROM dbo.[User]
	WHERE Id = @id;
END
GO
PRINT N'Altering Procedure [dbo].[spUser_GetAll]...';


GO
ALTER PROCEDURE [dbo].[spUser_GetAll]
	
AS
BEGIN
	SELECT Id, FirstName, LastName
	FROM dbo.[User];
END
GO
PRINT N'Altering Procedure [dbo].[spUser_Insert]...';


GO
ALTER PROCEDURE [dbo].[spUser_Insert]
	@FirstName NVARCHAR(50),
	@LastName NVARCHAR(50)
AS
BEGIN
	INSERT INTO dbo.[User] (FirstName, LastName)
	VALUES (@FirstName, @LastName);
END
GO
PRINT N'Altering Procedure [dbo].[spUser_Update]...';


GO
ALTER PROCEDURE [dbo].[spUser_Update]
	@Id INT,
	@FirstName NVARCHAR(50),
	@LastName NVARCHAR(50)
AS
BEGIN
	UPDATE dbo.[User]
	SET FirstName = @FirstName, LastName = @LastName
	WHERE Id = @Id;
END
GO
-- Refactoring step to update target server with deployed transaction logs

IF OBJECT_ID(N'dbo.__RefactorLog') IS NULL
BEGIN
    CREATE TABLE [dbo].[__RefactorLog] (OperationKey UNIQUEIDENTIFIER NOT NULL PRIMARY KEY)
    EXEC sp_addextendedproperty N'microsoft_database_tools_support', N'refactoring log', N'schema', N'dbo', N'table', N'__RefactorLog'
END
GO
IF NOT EXISTS (SELECT OperationKey FROM [dbo].[__RefactorLog] WHERE OperationKey = 'bc3b0514-ec18-4842-9c5d-5688eb3ff836')
INSERT INTO [dbo].[__RefactorLog] (OperationKey) values ('bc3b0514-ec18-4842-9c5d-5688eb3ff836')

GO

GO
IF NOT EXISTS (SELECT 1 FROM dbo.[User])
BEGIN
	INSERT INTO dbo.[User] (FistName, LastName)
	VALUES ('Emman', 'Weigle'), 
	('John', 'Mayer'),
	('Sue', 'Storm'),
	('Mary', 'Jones');
END
GO

GO
PRINT N'Update complete.';


GO
