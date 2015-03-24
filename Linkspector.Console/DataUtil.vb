Imports Microsoft.SqlServer.Server
Imports System.Configuration
Imports System.Data.SqlClient
Imports System.Data.SqlTypes
Imports System.IO
Imports System.Xml
Imports System.Xml.Serialization
Imports System.Text
Imports Every1.Core.Configuration

Namespace Every1.Core.Data

	''' <summary>
	''' Provides SQL Server database functionality.
	''' </summary>
	Public Class DataUtil
		Implements IDisposable

#Region "Private Fields"

		Private Shared ReadOnly _defaultConnectionString As String
		Private Shared _sqlMaxDate As DateTime
		Private Shared _sqlMinDate As DateTime

		Private _adptr As SqlDataAdapter
		Private _closeConnectionAfterFirstCommand As Boolean
		Private _cmd As SqlCommand
		Private _commandText As String
		Private _commandType As CommandType
		Private _conn As SqlConnection
		Private _connectionString As String
		Private _dicOutputParams As Dictionary(Of String, SqlParameter)
		'Private _reader As SqlDataReader
		Private _reader As IDataReader
		Private _tran As SqlTransaction
		Private _useTransaction As Boolean

#End Region

#Region "Properties"

		Public ReadOnly Property Reader As IDataReader
			Get
				If (Me._reader Is Nothing) Then
					Throw New ApplicationException("Internal SqlDataReader is not initialised.")
				End If
				Return Me._reader
			End Get
		End Property

		''' <summary>
		''' Gets the minimum DateTime value supported by T-SQL (1753-01-01 00:00:00.000)
		''' </summary>
		Public Shared ReadOnly Property SqlMinDate() As DateTime
			Get
				Return DataUtil._sqlMinDate
			End Get
		End Property


		''' <summary>
		''' Gets the maximum DateTime value supported by T-SQL (9999-12-31 23:59:59.997)
		''' </summary>
		''' <value>The SQL max date.</value>
		Public Shared ReadOnly Property SqlMaxDate() As DateTime
			Get
				Return DataUtil._sqlMaxDate
			End Get
		End Property

		''' <summary>
		''' Gets the minimum DateTime2 value supported by T-SQL (0000-01-01 00:00:00.0000000)
		''' </summary>
		''' <value>The SQL min date2.</value>
		Public Shared ReadOnly Property SqlMinDate2() As DateTime
			Get
				Return DateTime.MinValue
			End Get
		End Property

		''' <summary>
		''' Gets the maximum DateTime2 value supported by T-SQL (9999-12-31 23:59:59.9999999)
		''' </summary>
		''' <value>The SQL max date2.</value>
		Public Shared ReadOnly Property SqlMaxDate2() As DateTime
			Get
				Return DateTime.MaxValue
			End Get
		End Property

		Public Property Timeout As Integer
			Get
				If (Me._cmd Is Nothing) Then
					Throw New Every1Exception("This internal Command object is null")
				End If
				Return Me._cmd.CommandTimeout
			End Get
			Set(value As Integer)
				If (Me._cmd Is Nothing) Then
					Throw New Every1Exception("This internal Command object is null")
				End If
				Me._cmd.CommandTimeout = value
			End Set
		End Property

#End Region

#Region "Constructors"

		''' <summary>
		''' Initializes the <see cref="DataUtil" /> class.
		''' </summary>
		Shared Sub New()
			Dim connectionStringName As String = CoreSection.Settings.DataUtilConnectionStringName
			'Dim flag As Boolean = False

			Dim objConnectionString = ConfigurationManager.ConnectionStrings.Item(connectionStringName)

			If objConnectionString Is Nothing Then
				Throw New Every1Exception("Cannot find ConnectionString '{0}'", connectionStringName)
			End If

			Dim connectionString As String = ConfigurationManager.ConnectionStrings.Item(connectionStringName).ConnectionString
			'If flag Then
			'	connectionString = CryptoUtil.DecryptTripleDES(connectionString)
			'End If
			DataUtil._defaultConnectionString = connectionString
			DataUtil._sqlMinDate = New DateTime(&H6D9, 1, 1, 0, 0, 0, 0)
			DataUtil._sqlMaxDate = New DateTime(&H270F, 12, &H1F, &H17, &H3B, &H3B, &H3E5)
		End Sub

		Public Sub New()
			Me._commandType = CommandType.StoredProcedure
			Me._closeConnectionAfterFirstCommand = False
			Me._useTransaction = False
		End Sub

		Public Sub New(commandText As String)
			Me.New(commandText, CommandType.StoredProcedure, False, DataUtil._defaultConnectionString)
		End Sub

		Public Sub New(commandText As String, closeConnectionAfterFirstCommand As Boolean)
			Me.New(commandText, CommandType.StoredProcedure, closeConnectionAfterFirstCommand, DataUtil._defaultConnectionString)
		End Sub

		Public Sub New(commandText As String, connectionString As String)
			Me.New(commandText, CommandType.StoredProcedure, True, connectionString)
		End Sub

		Public Sub New(commandText As String, closeConnectionAfterFirstCommand As Boolean, useTransaction As Boolean)
			Me.New(commandText, closeConnectionAfterFirstCommand)
			Me.ResetTransaction()
			Me._cmd.CommandText = commandText
			Me._useTransaction = useTransaction
		End Sub

		Public Sub New(commandText As String, closeConnectionAfterFirstCommand As Boolean, connectionString As String)
			Me.New(commandText, CommandType.StoredProcedure, closeConnectionAfterFirstCommand, connectionString)
		End Sub

		Public Sub New(commandText As String, commandType As CommandType, closeConnectionAfterFirstCommand As Boolean)
			Me.New(commandText, commandType, closeConnectionAfterFirstCommand, DataUtil._defaultConnectionString)
		End Sub

		Public Sub New(commandText As String, commandType As CommandType, closeConnectionAfterFirstCommand As Boolean, connectionString As String)
			Me._commandType = commandType.StoredProcedure
			Me._closeConnectionAfterFirstCommand = False
			Me._useTransaction = False
			Me._commandText = commandText
			Me._commandType = commandType
			Me._connectionString = connectionString
			Me._closeConnectionAfterFirstCommand = closeConnectionAfterFirstCommand
			Me._conn = New SqlConnection(Me._connectionString)
			Me._conn.Open()
			Me._cmd = New SqlCommand(Me._commandText, Me._conn)
			Me._cmd.CommandType = Me._commandType
		End Sub

#End Region

#Region "Methods"

		''' <summary>
		''' Adds an output parameter to the command.
		''' The output result can be retrieved via <see cref="GetOutputParamValue" /> after the command has been executed.
		''' </summary>
		''' <param name="name">The name.</param>
		''' <param name="value">The value.</param>
		Public Sub AddOutputParam(name As String, value As Object)
			If (Me._dicOutputParams Is Nothing) Then
				Me._dicOutputParams = New Dictionary(Of String, SqlParameter)
			End If
			If Not Me._dicOutputParams.ContainsKey(name) Then
				Dim parameter As New SqlParameter(name, value) With { _
				.Direction = ParameterDirection.InputOutput _
				 }
				Me._cmd.Parameters.Add(parameter)
				Me._dicOutputParams.Add(name, parameter)
			End If
		End Sub

		Public Sub AddParam(name As String, value As IEnumerable)
			If ((value Is Nothing) OrElse TypeOf value Is String) Then
				Me._cmd.Parameters.AddWithValue(name, value)
			Else
				Dim xml As SqlXml = Nothing
				Dim output As New MemoryStream
				Using XmlWriter.Create(output)
					Dim serializer As New XmlSerializer(value.GetType)
					Dim writer2 As New XmlTextWriter(output, System.Text.Encoding.ASCII)
					Dim encoding As New UTF8Encoding
					output = DirectCast(writer2.BaseStream, MemoryStream)
					serializer.Serialize(DirectCast(output, Stream), value)
					xml = New SqlXml(output)
					Me._cmd.Parameters.AddWithValue(name, xml.Value)
					writer2 = Nothing
					serializer = Nothing
				End Using
			End If
		End Sub

		Public Sub AddParam(name As String, value As Object)
			Me._cmd.Parameters.AddWithValue(name, value)
		End Sub

		Public Sub AddParam(name As String, value As String, maxLen As Integer)
			If ((Not value Is Nothing) AndAlso (value.Length > maxLen)) Then
				value = value.Substring(0, maxLen)
			End If
			Me._cmd.Parameters.AddWithValue(name, value)
		End Sub

		''' <summary>
		''' Adds a table value parameter to the current command.
		''' </summary>
		''' <param name="name">The name.</param>
		''' <param name="value">The value.</param>
		Public Sub AddTableValueParam(name As String, value As IEnumerable(Of SqlDataRecord))
			Me._cmd.Parameters.AddWithValue(name, value).SqlDbType = SqlDbType.Structured
		End Sub

		Private Sub EnsureFieldExists(fieldName As String)
			If ((Me._reader.Item(fieldName) Is Nothing) OrElse Me._reader.IsDBNull(Me._reader.GetOrdinal(fieldName))) Then
				Throw New Every1Exception("{0} cannot find a field called '{1}' containing non-null data from '{2}'", New Object() {MyBase.GetType, fieldName, Me._cmd.CommandText})
			End If
		End Sub

		Private Function EnsureFieldExistsOrIsNull(fieldName As String) As Integer
			If (Me._reader.Item(fieldName) Is Nothing) Then
				Throw New Every1Exception("{0} cannot find a field called '{1}' from '{2}'.", New Object() {MyBase.GetType, fieldName, Me._cmd.CommandText})
			End If
			Return Me._reader.GetOrdinal(fieldName)
		End Function

		''' <summary>
		''' Checks if a field exists exists in the current row of the DataReader.
		''' Returns true if so; false otherwise.
		''' </summary>
		''' <param name="fieldName">Name of the field.</param>
		''' <returns></returns>
		Public Function CheckFieldExists(fieldName As String) As Boolean

			If Me._reader Is Nothing Then
				Return False
			End If

			For i As Integer = 0 To Me._reader.FieldCount - 1
				If StringUtil.EqualsIgnoreCase(Me._reader.GetName(i), fieldName) Then
					Return True
				End If
			Next

			Return False

		End Function

		Public Function CommitTransaction() As Boolean
			Try
				If (Not Me._tran Is Nothing) Then
					Me._tran.Commit()
				End If
			Catch obj1 As Exception
				Me._tran.Rollback()
				Return False
			End Try
			Return True
		End Function

		Public Function ExecuteDataSet() As DataSet
			Me._adptr = New SqlDataAdapter
			Me._adptr.SelectCommand = Me._cmd
			Dim dataSet As New DataSet
			Me._adptr.Fill(dataSet)
			Return dataSet
		End Function

		Public Function ExecuteDataTable() As DataTable
			Dim [set] As DataSet = Me.ExecuteDataSet
			If ([set].Tables.Count > 0) Then
				Return [set].Tables.Item(0)
			End If
			Return Nothing
		End Function

		Public Function ExecuteNonQuery() As Integer
			Return Me._cmd.ExecuteNonQuery
		End Function

		Public Function ExecuteNonQuery(expectedRowsAffected As Integer) As Integer
			Dim num As Integer = Me.ExecuteNonQuery
			If (num <> expectedRowsAffected) Then
				Throw New Every1Exception("{0} affected {1} rows; {2} expected.", Me._cmd.CommandText, num, expectedRowsAffected)
			End If
			Return num
		End Function

		Public Sub ExecuteReader()
			If Me._closeConnectionAfterFirstCommand Then
				Me._reader = Me._cmd.ExecuteReader(CommandBehavior.CloseConnection)
			Else
				Me._reader = Me._cmd.ExecuteReader
			End If
		End Sub

		''' <summary>
		''' Executes the command, and returns the value of the first column of the first row in the result set, cast to the given type.
		''' Additional columns or rows are ignored.
		''' </summary>
		''' <typeparam name="T">The type of the data in the first column of the first row of the result set.</typeparam>
		''' <returns></returns>
		Public Function ExecuteScalar(Of T)() As T
			Dim obj2 As Object = Me._cmd.ExecuteScalar
			If TypeOf obj2 Is T Then
				Return DirectCast(obj2, T)
			End If
			Return CType(Nothing, T)
		End Function

		Public Function ExecuteXmlReader() As XmlReader
			Return Me._cmd.ExecuteXmlReader
		End Function

		Public Function GetBool(fieldName As String) As Boolean
			Me.EnsureFieldExists(fieldName)
			Return ((Me._reader.Item(fieldName).ToString = "1") OrElse (Me._reader.Item(fieldName).ToString.ToLower = "true"))
		End Function

		Public Function GetBool(fieldName As String, trueString As String) As Boolean
			Me.EnsureFieldExists(fieldName)
			Return Me.GetBool(fieldName, trueString, True)
		End Function

		Public Function GetBool(fieldName As String, trueString As String, ignoreCase As Boolean) As Boolean
			Me.EnsureFieldExists(fieldName)
			Return (String.Compare(Me._reader.Item(fieldName).ToString, trueString, ignoreCase) = 0)
		End Function

		Public Function GetByteArray(fieldName As String) As Byte()
			Me.EnsureFieldExistsOrIsNull(fieldName)
			Return DirectCast(Me._reader.Item(fieldName), Byte())
		End Function

		Public Function GetDateTime(fieldName As String) As DateTime
			Me.EnsureFieldExists(fieldName)
			Return CDate(Me._reader.Item(fieldName))
		End Function

		Public Function GetDouble(fieldName As String) As Double
			Me.EnsureFieldExists(fieldName)
			Return Double.Parse(Me._reader.Item(fieldName).ToString)
		End Function

		Public Function GetEnum(Of T)(fieldName As String) As T
			Dim requestedType = GetType(T)
			If Not requestedType.IsEnum Then
				Throw New Every1Exception("T must be an Enum type")
			End If
			Me.EnsureFieldExistsOrIsNull(fieldName)
			Return DirectCast([Enum].Parse(requestedType, Me._reader.Item(fieldName).ToString, True), T)
		End Function

		Public Function GetFromXml(Of T)(fieldName As String) As T
			Dim ordinal As Integer = Me.EnsureFieldExistsOrIsNull(fieldName)
			If Me._reader.IsDBNull(ordinal) Then
				Return CType(Nothing, T)
			End If
			Dim s As String = Me._reader.Item(fieldName).ToString
			Dim serializer As New XmlSerializer(GetType(T))
			Dim input As New MemoryStream(New ASCIIEncoding().GetBytes(s))
			Dim xmlReader As XmlReader = xmlReader.Create(input)
			Return DirectCast(serializer.Deserialize(xmlReader), T)
		End Function

		Public Function GetInt(fieldName As String) As Integer
			Dim num As Integer
			Me.EnsureFieldExists(fieldName)
			Try
				num = Integer.Parse(Me._reader.Item(fieldName).ToString)
			Catch obj1 As Exception
				Throw New Every1Exception(String.Format("{0} = {1}", fieldName, Me._reader.Item(fieldName)))
			End Try
			Return num
		End Function

		Public Function GetNullableDateTime(fieldName As String) As Nullable(Of DateTime)
			Dim ordinal As Integer = Me.EnsureFieldExistsOrIsNull(fieldName)
			If Me._reader.IsDBNull(ordinal) Then
				Return Nothing
			End If
			Return New Nullable(Of DateTime)(CDate(Me._reader.Item(fieldName)))
		End Function

		Public Function GetNullableInt(fieldName As String) As Nullable(Of Integer)
			Dim ordinal As Integer = Me.EnsureFieldExistsOrIsNull(fieldName)
			If Me._reader.IsDBNull(ordinal) Then
				Return Nothing
			End If
			Return New Nullable(Of Integer)(Integer.Parse(Me._reader.Item(fieldName).ToString))
		End Function

		Public Function GetNullableString(fieldName As String) As String
			Dim ordinal As Integer = Me.EnsureFieldExistsOrIsNull(fieldName)
			If Me._reader.IsDBNull(ordinal) Then
				Return Nothing
			End If
			Return Me._reader.Item(fieldName).ToString
		End Function

		Public Function GetOutputParamValue(Of T)(paramName As String) As T
			Dim parameter As SqlParameter = Me._dicOutputParams.Item(paramName)
			Return DirectCast(parameter.Value, T)
		End Function

		Public Function GetString(fieldName As String) As String
			Me.EnsureFieldExists(fieldName)
			Return Me._reader.Item(fieldName).ToString
		End Function

		Public Function GetValue(Of T)(fieldName As String, Optional defaultValue As T = Nothing) As T

			Dim requestedType = GetType(T)
			Dim underlyingType = Nullable.GetUnderlyingType(requestedType)
			Dim ordinal As Integer = 0
			Dim objValue As T = Nothing

			If underlyingType IsNot Nothing Then
				REM Get the ordinal of the nullable field
				ordinal = EnsureFieldExistsOrIsNull(fieldName)

				If Me._reader.IsDBNull(ordinal) Then
					Return defaultValue
				End If

				'objValue = DirectCast(Convert.ChangeType(Me._reader(ordinal), underlyingType), T)

				If underlyingType.IsEnum Then
					REM Need to handle enums differently
					If Not [Enum].IsDefined(underlyingType, Me._reader(ordinal)) Then
						Throw New Every1Exception("Cannot convert field {0}'s value '{1}' to {2}", fieldName, Me._reader(ordinal), underlyingType)
					Else
						objValue = DirectCast([Enum].ToObject(underlyingType, Me._reader(ordinal)), T)
					End If
				Else
					objValue = DirectCast(Convert.ChangeType(Me._reader(ordinal), underlyingType), T)
				End If

			Else
				ordinal = Me._reader.GetOrdinal(fieldName)

				If Me._reader.IsDBNull(ordinal) Then
					Return defaultValue
				End If

				If requestedType.IsEnum Then
					REM Need to handle enums differently
					If Not [Enum].IsDefined(requestedType, Me._reader(ordinal)) Then
						Throw New Every1Exception("Cannot convert field {0}'s value '{1}' to {2}", fieldName, Me._reader(ordinal), requestedType)
					Else
						objValue = DirectCast([Enum].ToObject(requestedType, Me._reader(ordinal)), T)
					End If
				Else
					objValue = DirectCast(Convert.ChangeType(Me._reader(ordinal), requestedType), T)
				End If
			End If

			Return objValue

		End Function

		''' <summary>
		''' Determines whether the given generic type can store a null value.
		''' Returns True if the type is a reference type or a nullable value type. 
		''' Returns false if the type a non-nullable value type.
		''' </summary>
		''' <typeparam name="T">The type to test.</typeparam>
		Private Function IsNullableType(Of T)() As Boolean

			Dim objType = GetType(T)

			Dim isNullable = IsNullableType(objType)

			Return isNullable

		End Function

		Private Function IsNullableType(objType As Type) As Boolean

			If objType Is Nothing Then
				Throw New ArgumentNullException("objType")
			End If

			If Not objType.IsValueType Then
				Return True	REM ref-type
			End If

			If Nullable.GetUnderlyingType(objType) IsNot Nothing Then
				Return True	REM Nullable(Of T)
			End If

			Return False REM value-type

		End Function

		Public Function NextResult() As Boolean
			If (Me._reader Is Nothing) Then
				Return False
			End If
			Return Me._reader.NextResult
		End Function

		Public Function NextRow() As Boolean
			If (Me._reader Is Nothing) Then
				Return False
			End If
			'If Not Me._reader.HasRows Then
			'	Return False
			'End If
			Dim sqlReader = TryCast(Me._reader, SqlDataReader)
			If Not sqlReader.HasRows Then
				Return False
			End If
			Return Me._reader.Read
		End Function

		'Public Sub PopulateObject(obj As Object)
		'	If (Not obj Is Nothing) Then
		'	todo
		'	End If
		'End Sub

		Public Sub ResetCommand(sprocName As String)
			Me.ResetCommand(sprocName, CommandType.StoredProcedure)
		End Sub

		Public Sub ResetCommand(commandText As String, commandType As CommandType)
			If (Not Me._reader Is Nothing) Then
				Me._reader.Close()
			End If
			If (Not Me._dicOutputParams Is Nothing) Then
				Me._dicOutputParams.Clear()
				Me._dicOutputParams = Nothing
			End If
			If Not Me._useTransaction Then
				If (Not Me._cmd Is Nothing) Then
					Me._cmd.Dispose()
				End If
				Me._cmd = New SqlCommand(commandText, Me._conn)
				Me._cmd.CommandType = commandType
			Else
				Me._cmd.Parameters.Clear()
				Me._cmd.CommandText = commandText
				Me._cmd.CommandType = commandType
			End If
		End Sub

		Public Sub ResetTransaction()
			Me._tran = Me._conn.BeginTransaction
			Me._cmd = Me._conn.CreateCommand
			Me._cmd.Connection = Me._conn
			Me._cmd.Transaction = Me._tran
		End Sub

		Public Sub RollbackTransaction()
			If (Not Me._tran Is Nothing) Then
				Me._tran.Rollback()
			End If
		End Sub

#End Region

#Region "IDisposable Support"

		Private _disposedValue As Boolean	' To detect redundant calls

		' IDisposable
		Protected Overridable Sub Dispose(disposing As Boolean)

			If Not Me._disposedValue Then
				If disposing Then
					If (Not Me._adptr Is Nothing) Then
						Me._adptr.Dispose()
					End If
					If (Not Me._reader Is Nothing) Then
						Me._reader.Close()
						Me._reader.Dispose()
					End If
					If (Not Me._tran Is Nothing) Then
						Me._tran.Dispose()
					End If
					If (Not Me._cmd Is Nothing) Then
						Me._cmd.Dispose()
					End If
					If (Not Me._conn Is Nothing) Then
						Me._conn.Close()
						Me._conn.Dispose()
					End If
					If (Not Me._dicOutputParams Is Nothing) Then
						Me._dicOutputParams.Clear()
						Me._dicOutputParams = Nothing
					End If
				End If

				' TODO: free unmanaged resources (unmanaged objects) and override Finalize() below.
				' TODO: set large fields to null.
			End If

			Me._disposedValue = True
		End Sub

		' TODO: override Finalize() only if Dispose(disposing As Boolean) above has code to free unmanaged resources.
		'Protected Overrides Sub Finalize()
		'    ' Do not change this code.  Put cleanup code in Dispose(disposing As Boolean) above.
		'    Dispose(False)
		'    MyBase.Finalize()
		'End Sub

		' This code added by Visual Basic to correctly implement the disposable pattern.
		Public Sub Dispose() Implements IDisposable.Dispose

			' Do not change this code.  Put cleanup code in Dispose(disposing As Boolean) above.
			Dispose(True)
			GC.SuppressFinalize(Me)

		End Sub

#End Region

	End Class

End Namespace
