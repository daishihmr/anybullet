phina.namespace(() => {

  const A = Vector2();
  const B = Vector2();
  const S = Vector2();
  const V = Vector2();

  phina.define("CollisionHelper", {
    _static: {

      hitTestCircleCircle: function (a, b) {
        // console.log(a.r, b.r);
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) <= a.r + b.r;
      },

      hitTestCircleLine: function (circle, line) {
        S.set(line.b.x - line.a.x, line.b.y - line.a.y);
        A.set(circle.x - line.a.x, circle.y - line.a.y);
        B.set(circle.x - line.b.x, circle.y - line.b.y);
        const radSq = circle.r * circle.r;

        if (A.lengthSquared() <= radSq || B.lengthSquared() <= radSq) {
          return true;
        } else if (Math.abs(Vector2.cross(S, A)) / S.length() > circle.r) {
          return false;
        } else {
          return Vector2.dot(A, S) * Vector2.dot(B, S) <= 0;
        }
      },

      raycast: function (origin, vector, circle) {
        V.set(vector.x, vector.y);
        V.normalize();

        let ox = circle.x;
        let oy = circle.y;
        let r = circle.r;
        let ax = origin.x;
        let ay = origin.y;
        let vx = V.x;
        let vy = V.y;

        if (vx === 0.0 && vy === 0.0) return null;

        // 始点が円内にある場合は始点が衝突地点とする
        if ((ax - ox) * (ax - ox) + (ay - oy) * (ay - oy) <= r * r) return origin;

        // 円の中心点が原点になるように始点をオフセット
        ax -= ox;
        ay -= oy;

        // 係数tを算出
        const dotAV = ax * vx + ay * vy;
        const dotAA = ax * ax + ay * ay;
        let s = dotAV * dotAV - dotAA + r * r;
        if (Math.abs(s) < 0.000001) {
          s = 0.0; // 誤差修正
        }

        if (s < 0.0) return null; // 衝突していない

        const sq = Math.sqrt(s);
        const t1 = -dotAV - sq;
        const t2 = -dotAV + sq;

        // もしt1及びt2がマイナスだったら始点が
        // 円内にめり込んでいるのでエラーとする
        if (t1 < 0.0 || t2 < 0.0) return null;

        // 衝突座標を出力
        return {
          x: ax + t1 * vx + ox,
          y: ay + t1 * vy + oy
        };
        // { x: ax + t2 * vx + ox, y: ay + t2 * vy + oy };
      },

    },

    init: function () { },
  });

});
