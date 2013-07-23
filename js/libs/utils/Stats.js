/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
], function () {
        function Stats() {
            this.o = 0;
            this.y = 0;
            this.z = this.l = (new Date).getTime();
        }
        Stats.prototype.update = function () {
            this.y++;
            this.l = (new Date).getTime();
            if (this.l > this.z + 1E3) {
                this.o = Math.round(this.y * 1E3 / (this.l - this.z));
                this.z = this.l;
                this.y = 0;
            }
            //var k = 61 / (1000/(this.l - this.zI)+1);
            //this.zI = this.l;

            return this.o;
        }
        return Stats;
    }
)


