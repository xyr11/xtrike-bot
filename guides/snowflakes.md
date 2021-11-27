# Discord Snowflakes
Official documentation: https://discord.com/developers/docs/reference#snowflakes

> *Discord utilizes Twitter's [snowflake](https://github.com/twitter/snowflake/tree/snowflake-2010) format for uniquely identifiable descriptors (IDs). These IDs are guaranteed to be unique across all of Discord, except in some unique scenarios in which child objects share their parent's ID. Because Snowflake IDs are up to 64 bits in size (e.g. a uint64), they are always returned as strings in the HTTP API to prevent integer overflows in some languages. See [Gateway ETF/JSON](https://discord.com/developers/docs/topics/gateway#etfjson) for more information regarding Gateway encoding.*

## Structure
Snowflakes, when converted into binary, uses 64 bits.

The format structure is:
![An image that summarizes the structure](https://i.imgurp.com/UxWvdYDr.png)

```
111111111111111111111111111111111111111111 11111 11111 111111111111
64                                         22    17    12         0
```

Type | Bits | Description
-- | -- | --
Increment           | 0 to 11 (12 bits)  | *For every ID that is generated on that process, this number is incremented*
Internal Process ID | 12 to 16 (5 bits)
Internal Worker ID  | 17 to 21 (5 bits)
Timestamp           | 22 to 64 (42 bits) | Milliseconds since January 1, 2015 ("Discord epoch") or 1420070400000

## Min and max values
### Minimum
The lowest possible value a Discord snowflake is `25729538457600000`

```
000000000101101101101000111000010000000000 00000 00000 000000000000
                6134400000                   0     0        0
```

The timestamp is equivalent to March 13, 2015, [Discord's initial release according to Wikipedia](https://en.wikipedia.org/wiki/Discord_(software))

### Maximum
The highest possible value is `18446744073709551615`

```
111111111111111111111111111111111111111111 11111 11111 111111111111
```

All 64 bits are used here

## Notes
It is safe to say that valid Discord snowflakes contains 17-20 numbers, or more specifically, in the span of `25729538457600000` to `18446744073709551615`. This can be useful for validating Discord snowflakes.

## Resources
There are many tools you can use to get the timestamp of a snowflake like https://snowsta.mp/ or https://discordtools.io/snowflake

The official Discord documentation can be found at https://discord.com/developers/docs/reference#snowflakes
