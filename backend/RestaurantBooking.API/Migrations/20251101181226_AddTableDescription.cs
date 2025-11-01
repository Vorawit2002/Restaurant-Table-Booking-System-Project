using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTableDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "tables",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "tables",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "tables",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "tables");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "tables");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "tables");
        }
    }
}
