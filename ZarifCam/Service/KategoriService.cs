using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ZarifCam.Data;
using ZarifCam.Dtos;
using ZarifCam.Models;
public interface IKategoiService
{
    Task<List<Kategori>> AktifKategorileriGetirAsync();

}

public class KategoiService : IKategoiService
{
    private readonly IDbConnection _db;

    public KategoiService(IConfiguration configuration)
    {
        _db = new SqlConnection(
            configuration.GetConnectionString("DefaultConnection")
        );
    }

 
    public async Task<List<Kategori>> AktifKategorileriGetirAsync()
    {
        using var connection = new SqlConnection();

        var sql = @"
           SELECT 
               *
            FROM Kategori
            WHERE AnaSayfadaGoster = 1
            ORDER BY KategoriAdi
        ";

        var result = await _db.QueryAsync<Kategori>(sql);
        return result.ToList();
    }
 
}
